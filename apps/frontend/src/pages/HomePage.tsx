export function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold text-secondary-900 sm:text-6xl">
          Discover AI-Generated
          <span className="block text-primary-600">Digital Art</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg text-secondary-600">
          Explore, collect, and create unique AI-generated artworks on the blockchain. 
          Each piece is a one-of-a-kind digital collectible.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn-primary px-8 py-3 text-lg">
            Start Exploring
          </button>
          <button className="btn-outline px-8 py-3 text-lg">
            Create Art
          </button>
        </div>
      </div>
      
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card p-6 space-y-4">
            <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg" />
            <div>
              <h3 className="font-semibold text-secondary-900">AI Artwork #{i}</h3>
              <p className="text-secondary-600">Generated with AI Model</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-secondary-500">0.1 ETH</span>
                <button className="btn-primary text-sm px-3 py-1">View</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
