//import useBaseUrl from '@docusaurus/useBaseUrl';

module.exports = {
  docs: [
    {
      type: 'category',
      label: 'Cornerstone-Core',
      collapsed: true,
      items: [
        'core-introduction',
        {
          type: 'category',
          label: 'Setup',
          collapsed: true,
          items: ['core-installation', 'core-configuration'],
        },
        {
          type: 'category',
          label: 'Concepts',
          collapsed: true,
          items: [
            'concepts/imageId',
            'concepts/imageLoader',
            'concepts/volumeLoader',
            'concepts/metadataProvider',
            'concepts/images',
            'concepts/volumes',
            'concepts/cache',
            'concepts/scenes',
            'concepts/viewports',
            'concepts/renderingEngine',
          ],
        },
        'core-usage',
        'core-tests',
      ],
    },
    {
      type: 'category',
      label: 'Cornerstone-Tools',
      collapsed: true,
      items: [
        'tools-introduction',
        {
          type: 'category',
          label: 'Setup',
          collapsed: true,
          items: ['tools-installation', 'tools-configuration'],
        },
        {
          type: 'category',
          label: 'Concepts',
          collapsed: true,
          items: [
            'concepts/tools',
            'concepts/synchronizers',
            'concepts/state-management',
            'concepts/tools-eventListeners',
          ],
        },
        'tools-usage',
      ],
    },
    'migrationGuides',
    'help',
    'contributing',
    {
      type: 'link',
      label: 'Test Coverage Report',
      href: '/coverage',
    },
  ],
  api: [
    {
      type: 'category',
      label: 'Cornerstone Core',
      collapsed: true,
      items: [
        {
          type: 'autogenerated',
          dirName: 'cornerstone-render',
        },
      ],
    },
    {
      type: 'category',
      label: 'Cornerstone Tools',
      collapsed: true,
      items: [
        {
          type: 'autogenerated',
          dirName: 'cornerstone-tools',
        },
      ],
    },
    {
      type: 'category',
      label: 'Cornerstone Volume Loader',
      collapsed: true,
      items: [
        {
          type: 'autogenerated',
          dirName: 'cornerstone-image-loader-streaming-volume',
        },
      ],
    },
  ],
}
