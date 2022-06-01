import { Link } from "react-router-dom";

function CollectionCover() {
  return (
    <div className="max-w-sm mx-auto bg-slate-600 rounded-xl shadow-md hover:shadow-lg overflow-hidden md:max-w-l">
      <div className="p-5">
        <img
          className="h-48 object-cover md:w-full rounded-lg"
          src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2670&q=80"
          alt="Man looking at item at a store"
        />
      </div>
      <div className="px-8 pb-4 my-auto">
        <div className="uppercase tracking-wide text-sm text-white font-semibold">
          Web &amp; Mobile Industry
        </div>
        <span className="block mt-1 text-sm leading-tight text-zinc-300">
          9 Web Links
        </span>
        <div className="pt-5 flex ">
          <div className="flex mb-5 -space-x-4">
            <img
              className="w-10 h-10 border-2 border-white rounded-full dark:border-gray-800"
              src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
              alt=""
            />
            <img
              className="w-10 h-10 border-2 border-white rounded-full dark:border-gray-800"
              src="https://flowbite.com/docs/images/people/profile-picture-2.jpg"
              alt=""
            />
            <img
              className="w-10 h-10 border-2 border-white rounded-full dark:border-gray-800"
              src="https://flowbite.com/docs/images/people/profile-picture-3.jpg"
              alt=""
            />
            <img
              className="w-10 h-10 border-2 border-white rounded-full dark:border-gray-800"
              src="https://flowbite.com/docs/images/people/profile-picture-4.jpg"
              alt=""
            />
          </div>
          <span className="pt-2.5 pl-3 text-sm leading-tight text-zinc-300">
            Favorited by 4 friends
          </span>
        </div>
        <Link
          to="demo"
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
