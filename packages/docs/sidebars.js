//import useBaseUrl from '@docusaurus/useBaseUrl';

module.exports = {
  docs: [
    {
      type: 'category',
      label: 'Introduction',
      link: {
        type: 'generated-index',
        title: 'Introduction',
        description: 'An Introduction to cornerstone3D',
      },
      items: [
        'introduction/overview',
        'introduction/scope',
        'introduction/related-libraries',
      ],
    },
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: true,
      items: [
        'getting-started/core-installation',
        'getting-started/tools-installation',
      ],
    },
    {
      type: 'category',
      label: 'Tutorials',
      collapsed: true,
      items: ['tutorials/core-usage', 'tutorials/tools-usage'],
    },
    {
      type: 'category',
      label: 'How-to Guides',
      collapsed: true,
      items: [
        'how-to-guides/core-configuration',
        'how-to-guides/tools-configuration',
        'how-to-guides/custom-tools',
      ],
    },
    {
      type: 'category',
      label: 'Concepts',
      collapsed: true,
      items: [
        {
          type: 'category',
          label: 'Core',
          collapsed: true,
          items: [
            'concepts/cornerstone-core/imageId',
            'concepts/cornerstone-core/imageLoader',
            'concepts/cornerstone-core/volumeLoader',
            'concepts/cornerstone-core/metadataProvider',
            'concepts/cornerstone-core/images',
            'concepts/cornerstone-core/volumes',
            'concepts/cornerstone-core/cache',
            'concepts/cornerstone-core/scenes',
            'concepts/cornerstone-core/viewports',
            'concepts/cornerstone-core/renderingEngine',
            'concepts/cornerstone-core/requestPoolManager',
          ],
        },
        {
          type: 'category',
          label: 'Tools',
          collapsed: true,
          items: [
            'concepts/cornerstone-tools/tools',
            'concepts/cornerstone-tools/synchronizers',
            'concepts/cornerstone-tools/state-management',
            'concepts/cornerstone-tools/tools-eventListeners',
            'concepts/cornerstone-tools/toolsStyle',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Contributing',
      collapsed: true,
      items: ['contribute/pull-request', 'contribute/tests'],
    },
    'migrationGuides',
    {
      type: 'link',
      label: 'Test Coverage Report',
      href: '/coverage',
    },
    'faq',
  ],
}
