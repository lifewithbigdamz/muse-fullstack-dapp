import { User, Settings, Heart, ShoppingBag } from 'lucide-react'

export function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="card p-6 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-secondary-900">Artist Name</h2>
            <p className="text-secondary-600 mb-4">0x1234...5678</p>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary-600">Created</span>
                <span className="font-medium">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Collected</span>
                <span className="font-medium">156</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Favorites</span>
                <span className="font-medium">89</span>
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              <button className="btn-outline w-full py-2 flex items-center justify-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-3">
          <div className="space-y-8">
            <div>
              <div className="flex items-center space-x-4 mb-6">
                <button className="flex items-center space-x-2 text-primary-600 font-medium">
                  <ShoppingBag className="h-4 w-4" />
                  <span>Created</span>
                </button>
                <button className="flex items-center space-x-2 text-secondary-600">
                  <Heart className="h-4 w-4" />
                  <span>Favorites</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="card overflow-hidden group cursor-pointer">
                    <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-200 group-hover:scale-105 transition-transform" />
                    <div className="p-4">
                      <h3 className="font-semibold text-secondary-900">AI Artwork #{i}</h3>
                      <p className="text-sm text-secondary-600 mb-2">Generated with AI Model</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-secondary-900">0.1 ETH</span>
                        <button className="btn-primary text-sm px-3 py-1">View</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
