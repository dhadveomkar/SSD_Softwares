import { getSP } from './pnpConfig';
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

export const getProducts = async (context: any) => {
  const sp = getSP(context);

  return await sp.web.lists
    .getByTitle("Products")
    .items
    .select("Id", "Title", "Price", "Rating", "Image")
    .expand("Image")();
};

