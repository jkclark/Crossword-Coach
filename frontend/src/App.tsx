import type { CrosswordPuzzle } from "common/src/interfaces/CrosswordPuzzle";

function App() {
  const puzzle: CrosswordPuzzle = {
    id: "1",
    date: new Date(),
    source: "NYT",
    entries: [],
  };
  console.log(puzzle);

  return (
    <>
      <button className="btn">Hello</button>
    </>
  );
}

export default App;
