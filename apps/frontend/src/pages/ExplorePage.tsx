export function ExplorePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-secondary-900 mb-8">Explore Artworks</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-64 space-y-6">
          <div>
            <h3 className="font-semibold text-secondary-900 mb-3">Filters</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Category</label>
                <select className="input w-full">
                  <option>All Categories</option>
                  <option>Abstract</option>
                  <option>Portrait</option>
                  <option>Landscape</option>
                  <option>Fantasy</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Price Range</label>
                <select className="input w-full">
                  <option>Any Price</option>
                  <option>0 - 0.1 ETH</option>
                  <option>0.1 - 0.5 ETH</option>
                  <option>0.5 - 1 ETH</option>
                  <option>1+ ETH</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Sort By</label>
                <select className="input w-full">
                  <option>Recently Created</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Most Popular</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div key={i} className="card overflow-hidden group cursor-pointer">
                <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-200 group-hover:scale-105 transition-transform" />
                <div className="p-4">
                  <h3 className="font-semibold text-secondary-900">AI Artwork #{i}</h3>
                  <p className="text-sm text-secondary-600 mb-2">Generated with AI Model</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-secondary-900">0.1 ETH</span>
                    <button className="btn-primary text-sm px-3 py-1">Buy Now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
