import React, { useState, useRef, useEffect } from 'react';
import { Smile, Heart, Star, Rocket, Trophy } from 'lucide-react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose?: () => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('reactions');
  const pickerRef = useRef<HTMLDivElement>(null);

  // Popular emoji categories
  const emojiCategories = {
    reactions: {
      name: 'Reactions',
      icon: <Smile className="w-4 h-4" />,
      emojis: ['👍', '👎', '❤️', '🔥', '😄', '😢', '😡', '🎉', '👏', '🙏', '💯', '💪']
    },
    emotions: {
      name: 'Emotions',
      icon: <Heart className="w-4 h-4" />,
      emojis: ['😀', '😍', '🥰', '😎', '🤔', '😴', '🤯', '🥳', '😭', '😤', '🤩', '😇']
    },
    objects: {
      name: 'Objects',
      icon: <Star className="w-4 h-4" />,
      emojis: ['⭐', '💎', '🏆', '🎯', '🚀', '💡', '🔑', '🎁', '💻', '📱', '🎮', '🎵']
    },
    nature: {
      name: 'Nature',
      icon: <Star className="w-4 h-4" />,
      emojis: ['🌺', '🌲', '🌊', '🌈', '☀️', '🌙', '⭐', '🌸', '🍀', '🌿', '🌻', '🌹']
    },
    food: {
      name: 'Food',
      icon: <Trophy className="w-4 h-4" />,
      emojis: ['🍕', '🍔', '🍜', '🍣', '🍰', '☕', '🍺', '🍷', '🍫', '🍦', '🍎', '🥑']
    },
    activities: {
      name: 'Activities',
      icon: <Rocket className="w-4 h-4" />,
      emojis: ['⚽', '🏀', '🎾', '🏃', '🚴', '🏊', '🎨', '🎭', '🎪', '🎯', '🎲', '🎮']
    }
  };

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
  };

  return (
    <div
      ref={pickerRef}
      className="bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Add Reaction</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ×
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-1 mb-4 overflow-x-auto">
        {Object.entries(emojiCategories).map(([key, category]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === key
                ? 'bg-primary-100 text-primary-700 border border-primary-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {category.icon}
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Emoji Grid */}
      <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
        {emojiCategories[selectedCategory as keyof typeof emojiCategories].emojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => handleEmojiClick(emoji)}
            className="w-10 h-10 text-2xl hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
            title={`Add ${emoji} reaction`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Quick Reactions */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Reactions</h4>
        <div className="flex space-x-2">
          {['👍', '❤️', '🔥', '🎉', '👏'].map((emoji, index) => (
            <button
              key={index}
              onClick={() => handleEmojiClick(emoji)}
              className="w-8 h-8 text-lg hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500 text-center">
        Click an emoji to add it as a reaction
      </div>
    </div>
  );
};

export default EmojiPicker;
