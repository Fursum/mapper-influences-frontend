import { InfluenceTypeEnum } from "@libs/types/influence";
import { User } from "@libs/types/user";

const exampleMapList = [
  {
    artist: "NCT",
    title: "Before I Go (Blooom remix)",
    diff: "pjm",
    backgroundUrl: "https://assets.ppy.sh/beatmaps/1801710/covers/card.jpg",
    mapUrl: "https://osu.ppy.sh/beatmapsets/1801710#osu/3694128",
  },
  {
    artist: "NCT",
    title: "Before I Go (Blooom remix)",
    diff: "pjm",
    backgroundUrl: "https://assets.ppy.sh/beatmaps/1801710/covers/card.jpg",
    mapUrl: "https://osu.ppy.sh/beatmapsets/1729824#osu/3535240",
  },
  {
    artist: "NCT",
    title: "Before I Go (Blooom remix)",
    diff: "pjm",
    backgroundUrl: "https://assets.ppy.sh/beatmaps/1801710/covers/card.jpg",
    mapUrl: "https://osu.ppy.sh/beatmapsets/817932#osu/1715114",
  },
  {
    artist: "NCT",
    title: "Before I Go (Blooom remix)",
    diff: "pjm",
    backgroundUrl: "https://assets.ppy.sh/beatmaps/1801710/covers/card.jpg",
    mapUrl: "https://osu.ppy.sh/beatmapsets/1570536#osu/3460598",
  },
  {
    artist: "NCT",
    title: "Before I Go (Blooom remix)",
    diff: "pjm",
    backgroundUrl: "https://assets.ppy.sh/beatmaps/1801710/covers/card.jpg",
    mapUrl: "https://osu.ppy.sh/beatmapsets/1570536",
  },
];

export const userData: User = {
  id: 12345,
  username: "Skytuna",
  avatarUrl: "https://a.ppy.sh/4865030?1650115534.jpeg",
  description: "Test description",
  maps: exampleMapList,
  details: {
    followerCount: 1,
    graveyardCount: 1,
    lovedCount: 0,
    pendingCount: 1,
    rankedCount: 0,
    subCount: 2,
  },
  influences: [
    {
      profileData: {
        avatarUrl: "https://a.ppy.sh/4865030?1650115534.jpeg",
        id: 12345,
        username: "Fursum",
      },
      type: InfluenceTypeEnum.Respect,
      strength: 2,
      description: "",
      lastUpdated: Date.now(),
      maps: exampleMapList,
    },
    {
      profileData: {
        avatarUrl: "https://a.ppy.sh/4865030?1650115534.jpeg",
        id: 1,
        username: "Edisberkserbest",
        groups: [
          {
            colour: "red",
            has_listing: false,
            has_playmodes: false,
            id: 1234,
            identifier: "Nomination Assesment Team",
            is_probationary: false,
            name: "Nomination Assesment Team",
            playmodes: [],
            short_name: "NAT",
          },
        ],
      },
      type: InfluenceTypeEnum.Respect,
      strength: 1,
      description: "",
      lastUpdated: Date.now(),
      maps: exampleMapList,
    },
    {
      profileData: {
        avatarUrl: "https://a.ppy.sh/4865030?1650115534.jpeg",
        id: 2,
        username: "MMMMMMMMMMMMM",
        groups: [
          {
            colour: "red",
            has_listing: false,
            has_playmodes: false,
            id: 1234,
            identifier: "Nomination Assesment Team",
            is_probationary: false,
            name: "Nomination Assesment Team",
            playmodes: [],
            short_name: "NAT",
          },
        ],
      },
      type: InfluenceTypeEnum.Fascination,
      strength: 3,
      description: "",
      lastUpdated: Date.now(),
      maps: exampleMapList,
    },
    {
      profileData: {
        avatarUrl: "https://a.ppy.sh/4865030?1650115534.jpeg",
        id: 3,
        username: "WWWWWWWWWWWWW",
        groups: [
          {
            colour: "purple",
            has_listing: false,
            has_playmodes: false,
            id: 1234,
            identifier: "Nomination Assesment Team",
            is_probationary: false,
            name: "Nomitator",
            playmodes: [],
            short_name: "BN",
          },
        ],
      },
      type: InfluenceTypeEnum.Implementation,
      strength: 3,
      description: "",
      lastUpdated: Date.now(),
      maps: exampleMapList,
    },
    {
      profileData: {
        avatarUrl: "https://a.ppy.sh/4865030?1650115534.jpeg",
        id: 4,
        username: "Fursum",
      },
      type: InfluenceTypeEnum.Respect,
      strength: 2,
      description: "",
      lastUpdated: Date.now(),
      maps: exampleMapList,
    },
    {
      profileData: {
        avatarUrl: "https://a.ppy.sh/4865030?1650115534.jpeg",
        id: 5,
        username: "Fursum",
      },
      type: InfluenceTypeEnum.Respect,
      strength: 2,
      description: "",
      lastUpdated: Date.now(),
      maps: exampleMapList,
    },
  ],
  mentions: [
    {
      id: 12345,
      username: "Fursum",
      avatarUrl: "https://a.ppy.sh/4865030?1650115534.jpeg",
    },
    {
      id: 123456,
      username: "Fursum",
      avatarUrl: "https://a.ppy.sh/4865030?1650115534.jpeg",
    },
    {
      id: 1234567,
      username: "Fursum",
      avatarUrl: "https://a.ppy.sh/4865030?1650115534.jpeg",
    },
  ],
};
