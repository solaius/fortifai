// Mock for PatternFly icons
const React = require('react');

// Create a generic icon component
const createMockIcon = (name) => {
  return React.forwardRef((props, ref) => {
    return React.createElement('svg', {
      ref,
      'data-testid': `icon-${name}`,
      viewBox: '0 0 24 24',
      fill: 'currentColor',
      ...props
    }, React.createElement('path', {
      d: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'
    }));
  });
};

// Export commonly used icons
module.exports = createMockIcon('default');
module.exports.default = createMockIcon('default');

// Add specific icon mocks
module.exports.DatabaseIcon = createMockIcon('database');
module.exports.KeyIcon = createMockIcon('key');
module.exports.LinkIcon = createMockIcon('link');
module.exports.ShieldAltIcon = createMockIcon('shield-alt');
module.exports.ClipboardIcon = createMockIcon('clipboard');
module.exports.PlusIcon = createMockIcon('plus');
module.exports.ExclamationTriangleIcon = createMockIcon('exclamation-triangle');
module.exports.CheckCircleIcon = createMockIcon('check-circle');
