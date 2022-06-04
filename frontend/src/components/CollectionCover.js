import { Link, useParams } from "react-router-dom";
import { useCollection } from "../hooks/collections";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

function CollectionCover(props) {
  var { id } = useParams();
  if (!!props.id) {
    id = props.id;
  }
  const dispatch = useDispatch();
  const data = useCollection(id);

  useEffect(() => {
    dispatch({ type: "FETCH_COLLECTION", id });
  }, [dispatch, id]);

  return (
    <div className="max-w-sm mx-auto bg-slate-600 rounded-xl shadow-md hover:shadow-lg overflow-hidden md:max-w-l">
      <div className="p-5">
        <img
          className="h-48 object-cover md:w-full rounded-lg"
          src={data?.image_url}
          alt="Cover"
        />
      </div>
      <div className="px-8 pb-4 my-auto">
        <div className="uppercase tracking-wide text-sm text-white font-semibold">
          {data?.title || "No Title"}
        </div>
        <span className="block mt-1 text-sm leading-tight text-zinc-300">
          {data?.subtitle || "No Subtitle"}
        </span>
        <div className="pt-5 flex ">
          <div className="flex mb-5 -space-x-4">
            {data && data.profile_pics
              ? data.profile_pics.map((img, index) => (
                  <img
                    className="w-10 h-10 border-2 border-white rounded-full dark:border-gray-800"
                    src={img}
                    key={`img-${index}`}
                    alt={`img-${index}`}
                  />
                ))
              : null}
          </div>
          <span className="pt-2.5 pl-3 text-sm leading-tight text-zinc-300">
            {data?.status || ""}
          </span>
        </div>
        <Link
          to={`/${id}`}
          type="button"
          className="w-full text-center text-white bg-[#050708] hover:bg-[#050708]/90 focus:ring-4 focus:outline-none focus:ring-[#050708]/50 font-small rounded-lg text-sm px-5 py-2.5 dark:focus:ring-[#050708]/50 dark:hover:bg-[#050708]/30 mr-2 mb-2"
        >
          View Collection
        </Link>
      </div>
    </div>
  );
}

export default CollectionCover;
