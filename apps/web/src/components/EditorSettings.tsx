import React, { useState } from 'react';
import { Switch } from '@headlessui/react';

interface EditorSettingsProps {
  // Add any props if needed
}

const EditorSettings: React.FC<EditorSettingsProps> = () => {
  const [showMinimap, setShowMinimap] = useState(true);

  const handleMinimapToggle = () => {
    setShowMinimap(!showMinimap);
  };

  return (
    <div>
      <Switch
        checked={showMinimap}
        onChange={handleMinimapToggle}
        className={`${
          showMinimap ? 'bg-blue-600' : 'bg-gray-200'
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2`}
      >
        <span
          className={`${
            showMinimap ? 'translate-x-5' : 'translate-x-0'
          } pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out`}
        />
      </Switch>
      <label
        className="ml-3"
        onClick={(e) => {
          e.stopPropagation();
          handleMinimapToggle();
        }}
      >
        Show Minimap
      </label>
    </div>
  );
};

export default EditorSettings;