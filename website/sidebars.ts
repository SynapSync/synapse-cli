import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'intro',
    'getting-started',
    {
      type: 'category',
      label: 'Concepts',
      collapsed: false,
      items: [
        'concepts/cognitives',
        'concepts/providers',
        'concepts/sync',
      ],
    },
    {
      type: 'category',
      label: 'CLI Reference',
      collapsed: false,
      items: [
        'cli/commands/index',
        'cli/repl',
        {
          type: 'category',
          label: 'Commands',
          collapsed: true,
          items: [
            'cli/commands/init',
            'cli/commands/config',
            'cli/commands/status',
            'cli/commands/providers',
            'cli/commands/search',
            'cli/commands/add',
            'cli/commands/list',
            'cli/commands/uninstall',
            'cli/commands/sync',
            'cli/commands/update',
            'cli/commands/doctor',
            'cli/commands/clean',
            'cli/commands/purge',
            'cli/commands/help',
            'cli/commands/version',
            'cli/commands/info',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Registry',
      collapsed: true,
      items: [
        'registry/overview',
        'registry/publishing',
      ],
    },
  ],
};

export default sidebars;
