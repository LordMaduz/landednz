// The completion stamp: "Done" and the day, rotated; stamps in over 200 ms (static under reduced motion)
export function Stamp({ date }: { date: string }) {
  return (
    <div className="stamp" role="img" aria-label={`Done ${date}`}>
      <span>Done</span>
      <span className="font-medium">{date}</span>
    </div>
  )
}
