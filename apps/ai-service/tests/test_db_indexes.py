import asyncio

from pymongo.errors import OperationFailure

from src import db


class _AsyncIndexes:
    def __init__(self, indexes):
        self._indexes = iter(indexes)

    def __aiter__(self):
        return self

    async def __anext__(self):
        try:
            return next(self._indexes)
        except StopIteration as exc:
            raise StopAsyncIteration from exc


class _FakeCollection:
    def __init__(self, search_indexes=None, list_error=None, create_index_error=None):
        self.created_indexes = []
        self.created_search_indexes = []
        self.search_indexes = search_indexes or []
        self.list_error = list_error
        self.create_index_error = create_index_error

    async def create_index(self, keys, name):
        if self.create_index_error is not None:
            raise self.create_index_error
        self.created_indexes.append((keys, name))

    def list_search_indexes(self):
        if self.list_error is not None:
            raise self.list_error
        return _AsyncIndexes(self.search_indexes)

    async def create_search_index(self, model):
        self.created_search_indexes.append(model)


class _FakeDatabase:
    def __init__(self, collection):
        self.collection = collection
        self.created_collections = []

    async def create_collection(self, name):
        self.created_collections.append(name)

    def __getitem__(self, name):
        return self.collection


class _FakeClient:
    def __init__(self, database):
        self.database = database

    def __getitem__(self, name):
        return self.database


def test_ensure_collection_indexes_creates_standard_and_vector_indexes(monkeypatch):
    collection = _FakeCollection()
    database = _FakeDatabase(collection)
    monkeypatch.setattr(db, "_client", _FakeClient(database))

    asyncio.run(db.ensure_collection_indexes())

    assert database.created_collections == [db.settings.MONGODB_COLLECTION]
    assert collection.created_indexes == [
        ([("file_path", db.ASCENDING)], db.FILE_PATH_INDEX_NAME),
        (
            [("file_path", db.ASCENDING), ("chunk_index", db.ASCENDING)],
            db.FILE_PATH_CHUNK_INDEX_NAME,
        ),
    ]
    assert len(collection.created_search_indexes) == 1


def test_ensure_collection_indexes_ignores_duplicate_standard_index(monkeypatch):
    collection = _FakeCollection(
        create_index_error=OperationFailure("IndexOptionsConflict", code=85)
    )
    database = _FakeDatabase(collection)
    monkeypatch.setattr(db, "_client", _FakeClient(database))

    asyncio.run(db.ensure_collection_indexes())

    assert len(collection.created_search_indexes) == 1


def test_has_vector_search_index_returns_true_for_unsupported_search_indexes():
    collection = _FakeCollection(
        list_error=OperationFailure("search indexes unsupported", code=40324)
    )

    assert asyncio.run(db._has_vector_search_index(collection)) is True


def test_has_vector_search_index_returns_false_for_transient_failure():
    collection = _FakeCollection(
        list_error=OperationFailure("network timeout", code=89)
    )

    assert asyncio.run(db._has_vector_search_index(collection)) is False
