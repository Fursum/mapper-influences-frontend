import { create } from 'zustand';

type FilterStore = {
  filters: {
    mode: (typeof MODES)[number];
    status: (typeof STATUSES)[number];
    genre: (typeof GENRES)[number];
    language: (typeof LANGUAGES)[number];
  };
  setMode: (mode: (typeof MODES)[number]) => void;
  setStatus: (status: (typeof STATUSES)[number]) => void;
  setGenre: (genre: (typeof GENRES)[number]) => void;
  setLanguage: (language: (typeof LANGUAGES)[number]) => void;
  getQueryString: () => string;
};

export const useFilterStore = create<FilterStore>((set, get) => ({
  filters: {
    mode: 'Any',
    status: 'Any',
    genre: { name: 'Any', value: 0 },
    language: { name: 'Any', value: 0 },
  },
  setMode: (mode) => set((state) => ({ filters: { ...state.filters, mode } })),
  setStatus: (status) =>
    set((state) => ({ filters: { ...state.filters, status } })),
  setGenre: (genre) =>
    set((state) => ({ filters: { ...state.filters, genre } })),
  setLanguage: (language) =>
    set((state) => ({ filters: { ...state.filters, language } })),
  getQueryString: () => {
    const { mode, status, genre, language } = get().filters;

    const modeQuery = modeToSearchQuery(mode);
    const statusQuery = filterToSearchQuery(status);
    const genreQuery = genreToSearchQuery(genre);
    const languageQuery = languageToSearchQuery(language);

    return modeQuery + statusQuery + genreQuery + languageQuery;
  },
}));

export const STATUSES = [
  'Any',
  'Has Leaderboard',
  'Ranked',
  'Qualified',
  'Loved',
  'Favourites',
  'Pending',
  'WIP',
  'Graveyard',
  'My Maps',
] as const;

function filterToSearchQuery(filter: (typeof STATUSES)[number]) {
  switch (filter) {
    case 'Has Leaderboard':
      return '';
    case 'My Maps':
      return '&s=mine';
    case 'Any':
      return '&s=any';
    default:
      return `&s=${filter.toLowerCase()}`;
  }
}

export const MODES = [
  'Any',
  'osu!',
  'osu!taiko',
  'osu!catch',
  'osu!mania',
] as const;

function modeToSearchQuery(mode: (typeof MODES)[number]) {
  switch (mode) {
    case 'Any':
      return '';
    default:
      return `&m=${MODES.indexOf(mode) - 1}`;
  }
}

export const GENRES = [
  { name: 'Any', value: 0 },
  { name: 'Unspecified', value: 1 },
  { name: 'Video Game', value: 2 },
  { name: 'Anime', value: 3 },
  { name: 'Rock', value: 4 },
  { name: 'Pop', value: 5 },
  { name: 'Other', value: 6 },
  { name: 'Novelty', value: 7 },
  { name: 'Hip Hop', value: 9 },
  { name: 'Electronic', value: 10 },
  { name: 'Metal', value: 11 },
  { name: 'Classical', value: 12 },
  { name: 'Folk', value: 13 },
  { name: 'Jazz', value: 14 },
] as const;

function genreToSearchQuery(genre: (typeof GENRES)[number]) {
  switch (genre.name) {
    case 'Any':
      return '';
    default:
      return `&g=${genre.value}`;
  }
}

export const LANGUAGES = [
  { name: 'Any', value: 0 },
  { name: 'English', value: 2 },
  { name: 'Chinese', value: 4 },
  { name: 'French', value: 7 },
  { name: 'German', value: 8 },
  { name: 'Italian', value: 11 },
  { name: 'Japanese', value: 3 },
  { name: 'Korean', value: 6 },
  { name: 'Spanish', value: 10 },
  { name: 'Swedish', value: 9 },
  { name: 'Russian', value: 12 },
  { name: 'Polish', value: 13 },
  { name: 'Instrumental', value: 5 },
  { name: 'Unspecified', value: 1 },
  { name: 'Other', value: 14 },
] as const;

function languageToSearchQuery(language: (typeof LANGUAGES)[number]) {
  switch (language.name) {
    case 'Any':
      return '';
    default:
      return `&l=${language.value}`;
  }
}
