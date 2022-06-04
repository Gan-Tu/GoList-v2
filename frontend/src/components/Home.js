import CollectionCover from "./CollectionCover";

function Home() {
  return (
    <div class="grid grid-cols-2 gap-5">
      <CollectionCover id="web-mobile" />
      <CollectionCover id="demo" />
    </div>
  );
}

export default Home;
