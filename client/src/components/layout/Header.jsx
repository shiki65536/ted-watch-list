import React from "react";
import { LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Header = ({ onToggleMobileMenu, mobileMenuOpen, onShowAuth }) => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div className="bg-red-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              TED Manager
            </h1>
            <p className="text-red-100 mt-1 text-sm md:text-base hidden sm:block">
              Manage your learning playlist
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <span className="hidden md:inline text-sm text-red-100">
                  {user?.username || user?.email}
                </span>
                <button
                  onClick={logout}
                  className="p-2 hover:bg-red-700 rounded-lg transition-colors text-white"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <button
                onClick={onShowAuth}
                className="px-4 py-2 bg-white text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors"
              >
                Login
              </button>
            )}

            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 hover:bg-red-700 rounded-lg transition-colors text-white"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
