import React, { useState, useRef, useEffect } from 'react';
import { Smile, Heart, Star, Rocket, Trophy, X, Zap } from 'lucide-react';

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
    // Close the picker immediately after selection
    setTimeout(() => {
      onClose?.();
    }, 150);
  };

  return (
    <div
      ref={pickerRef}
      className="bg-surface border border-border rounded-xl shadow-2xl p-4 w-80 max-h-96 overflow-hidden glass"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-primary-500/20 rounded-lg">
            <Smile className="w-4 h-4 text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-textPrimary">Add Reaction</h3>
        </div>
        <button
          onClick={onClose}
          className="text-textTertiary hover:text-textPrimary transition-colors p-1 hover:bg-surfaceElevated rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-1 mb-4 overflow-x-auto pb-2">
        {Object.entries(emojiCategories).map(([key, category]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              selectedCategory === key
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30 shadow-sm'
                : 'text-textTertiary hover:text-textPrimary hover:bg-surfaceElevated'
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
            className="w-10 h-10 text-2xl hover:bg-surfaceElevated rounded-lg transition-all duration-200 flex items-center justify-center hover:scale-110 hover:shadow-sm"
            title={`Add ${emoji} reaction`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Quick Reactions */}
      <div className="mt-4 pt-3 border-t border-border">
        <div className="flex items-center space-x-2 mb-2">
          <Zap className="w-4 h-4 text-secondary-400" />
          <h4 className="text-sm font-medium text-textSecondary">Quick Reactions</h4>
        </div>
        <div className="flex space-x-2">
          {['👍', '❤️', '🔥', '🎉', '👏'].map((emoji, index) => (
            <button
              key={index}
              onClick={() => handleEmojiClick(emoji)}
              className="w-8 h-8 text-lg hover:bg-surfaceElevated rounded-lg transition-all duration-200 flex items-center justify-center hover:scale-110"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-border text-xs text-textTertiary text-center">
        Click an emoji to add it as a reaction
      </div>
    </div>
  );
};

export default EmojiPicker;