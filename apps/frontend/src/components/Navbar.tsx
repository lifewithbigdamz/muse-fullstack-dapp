import { Link, useLocation } from 'react-router-dom'
import { WalletConnect } from './WalletConnect'
import { Muse } from 'lucide-react'

export function Navbar() {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-secondary-200 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Muse className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-secondary-900">Muse</span>
            </Link>
            
            <div className="hidden md:flex space-x-8">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors ${
                  isActive('/') ? 'text-primary-600' : 'text-secondary-600 hover:text-secondary-900'
                }`}
              >
                Home
              </Link>
              <Link
                to="/explore"
                className={`text-sm font-medium transition-colors ${
                  isActive('/explore') ? 'text-primary-600' : 'text-secondary-600 hover:text-secondary-900'
                }`}
              >
                Explore
              </Link>
              <Link
                to="/mint"
                className={`text-sm font-medium transition-colors ${
                  isActive('/mint') ? 'text-primary-600' : 'text-secondary-600 hover:text-secondary-900'
                }`}
              >
                Create
              </Link>
              <Link
                to="/profile"
                className={`text-sm font-medium transition-colors ${
                  isActive('/profile') ? 'text-primary-600' : 'text-secondary-600 hover:text-secondary-900'
                }`}
              >
                Profile
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <WalletConnect />
          </div>
        </div>
      </div>
    </nav>
  )
}
