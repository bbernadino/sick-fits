import { PAGINATION_QUERY } from '../components/Pagination';

export default function paginationField() {
  return {
    keyArgs: false, // tells Apollo we will do it
    read(existing = [], { args, cache }) {
      console.log({ existing, args, cache });
      const { skip, first } = args;

      // Read the number of items on the page from the cache
      const data = cache.readQuery({ query: PAGINATION_QUERY });
      const count = data?._allProductsMeta?.count;
      const page = skip / first + 1;
      const pages = Math.ceil(count / first);

      // check if we have existing items
      const items = existing.slice(skip, skip + first).filter((x) => x);

      // if there are items AND there arent enough items to satisfy amount requested AND we are on the last page, then JUST SEND ITTTT
      if (items.length && items.length !== first && page === pages) {
        return items;
      }
      if (items.length !== first) {
        // we dont have items we must go to network to fetch them
        return false;
      }

      // if there are items, just return them from cache dont need to go to network
      if (items.length) {
        console.log(
          `There are ${items.length} in the cache! Gunna send them to Apollo!`
        );
        return items;
      }

      return false; // fallback to network

      // first thing it does is ask read function for the items.
      // We can do two things:
      // first, we can do is retunr the items because the are already in the cache
      // second, is to return the false from here, (network request)
    },
    merge(existing, incoming, { args }) {
      const { skip, first } = args;
      // this runs when the Apollo client comes back from the network with our products
      console.log(`Merging items from the network ${incoming.length}`);
      const merged = existing ? existing.slice(0) : [];
      for (let i = skip; i < skip + incoming.length; ++i) {
        merged[i] = incoming[i - skip];
      }
      console.log(merged);
      // finally we return merged items from the cache
      return merged;
    },
  };
}
