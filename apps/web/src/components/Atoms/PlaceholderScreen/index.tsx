interface PlaceholderScreenProps {
  title: string
}

function PlaceholderScreen({ title }: PlaceholderScreenProps) {
  return (
    <div>
      <h1 className="text-xl font-semibold">{title}</h1>
      <p>Em construção.</p>
    </div>
  )
}

export default PlaceholderScreen
