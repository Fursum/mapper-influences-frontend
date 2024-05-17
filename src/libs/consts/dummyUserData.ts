import { BeatmapType } from '@libs/types/user';
import type { InfluenceResponse } from '@services/influence';

const exampleMapList = [
  {
    featured_map_id: 3535240,
    beatmapset: {
      id: 1801709,
      status: BeatmapType.Graveyard,
      creator: 'Fursum',
      names: {
        artist: 'NCT',
        artist_unicode: 'NCT',
        title: 'Before I Go (Blooom remix)',
        title_unicode: 'Before I Go (Blooom remix)',
      },
      covers: {
        card: 'https://assets.ppy.sh/beatmaps/1801710/covers/card.jpg',
        cover: 'https://assets.ppy.sh/beatmaps/1801710/covers/cover.jpg',
        list: 'https://assets.ppy.sh/beatmaps/1801710/covers/list.jpg',
        slimcover:
          'https://assets.ppy.sh/beatmaps/1801710/covers/slimcover.jpg',
      },

      beatmaps: [
        {
          difficulty_rating: 5,
          id: 3535240,
          name: 'pjm',
          url: 'https://osu.ppy.sh/beatmapsets/1729824#osu/3535240',
        },
      ],
    },
  },
  {
    featured_map_id: 3535240,
    beatmapset: {
      id: 1801710,
      status: BeatmapType.Graveyard,
      creator: 'Fursum',
      names: {
        artist: 'NCT',
        artist_unicode: 'NCT',
        title: 'Before I Go (Blooom remix)',
        title_unicode: 'Before I Go (Blooom remix)',
      },
      covers: {
        card: 'https://assets.ppy.sh/beatmaps/1801710/covers/card.jpg',
        cover: 'https://assets.ppy.sh/beatmaps/1801710/covers/cover.jpg',
        list: 'https://assets.ppy.sh/beatmaps/1801710/covers/list.jpg',
        slimcover:
          'https://assets.ppy.sh/beatmaps/1801710/covers/slimcover.jpg',
      },

      beatmaps: [
        {
          difficulty_rating: 5,
          id: 3535240,
          name: 'pjm',
          url: 'https://osu.ppy.sh/beatmapsets/1729824#osu/3535240',
        },
      ],
    },
  },
  {
    featured_map_id: 3535240,
    beatmapset: {
      id: 1801711,
      status: BeatmapType.Graveyard,
      creator: 'Fursum',
      names: {
        artist: 'NCT',
        artist_unicode: 'NCT',
        title: 'Before I Go (Blooom remix)',
        title_unicode: 'Before I Go (Blooom remix)',
      },
      covers: {
        card: 'https://assets.ppy.sh/beatmaps/1801710/covers/card.jpg',
        cover: 'https://assets.ppy.sh/beatmaps/1801710/covers/cover.jpg',
        list: 'https://assets.ppy.sh/beatmaps/1801710/covers/list.jpg',
        slimcover:
          'https://assets.ppy.sh/beatmaps/1801710/covers/slimcover.jpg',
      },

      beatmaps: [
        {
          difficulty_rating: 5,
          id: 3535240,
          name: 'pjm',
          url: 'https://osu.ppy.sh/beatmapsets/1729824#osu/3535240',
        },
      ],
    },
  },
];

export const DUMMY_USER = {
  id: 12345,
  user_name: 'Test username',
  profile_picture: 'https://a.ppy.sh/4865030?1650115534.jpeg',
  flag: { code: 'TR', name: 'Türkiye' },
  groups: [
    {
      colour: 'red',
      has_listing: true,
      has_playmodes: false,
      id: 1,
      identifier: 'NAT',
      is_probationary: false,
      name: 'Nomination Assesment Team',
      playmodes: [],
      short_name: 'NAT',
    },
  ],
  bio: 'Test description',
  featured_maps: exampleMapList,
  graveyard_count: 1,
  loved_count: 0,
  //pending_count: 1,
  ranked_count: 0,
  guest_count: 2,
  nominated_count: 1,
  osu_data_modified_at: Date.now(),
  profile_data_modified_at: Date.now(),
};

export const DUMMY_INFLUENCES: InfluenceResponse[] = [
  {
    created_at: Date.now(),
    modified_at: Date.now(),
    from_id: 12345,
    to_id: DUMMY_USER.id,
    influence_level: 1,
    info: '',
  },
  {
    created_at: Date.now(),
    modified_at: Date.now(),
    from_id: 1234,
    to_id: DUMMY_USER.id,
    influence_level: 1,
    info: '',
  },
  {
    created_at: Date.now(),
    modified_at: Date.now(),
    from_id: 123,
    to_id: DUMMY_USER.id,
    influence_level: 1,
    info: '',
  },
  {
    created_at: Date.now(),
    modified_at: Date.now(),
    from_id: 12,
    to_id: DUMMY_USER.id,
    influence_level: 1,
    info: 'test info',
  },
];
