export default function ItemSnippet({ title, snippet, image, link_target }) {
  return (
    <div>
      <div className="flex items-center space-x-4 ">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
            {title}
          </p>
          <p className="text-sm text-gray-500 line-clamp-2 dark:text-gray-400 w-80">
            {snippet}
          </p>
        </div>
        <div className="flex-shrink-0 m-2">
          <img className="w-12 h-12 rounded" src={image} alt="Preview" />
        </div>
      </div>
      <span className="inline-flex justify-between text-xs font-normal text-gray-600">
        {link_target}
      </span>
    </div>
  );
}
