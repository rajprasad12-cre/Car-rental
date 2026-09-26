import React from 'react'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const NavbarOwner = () => {

    const {user} = useAppContext()

  return (
    <div className='flex items-center justify-between px-6 md:px-10 py-4 text-gray-500 dark:text-gray-400 border-b border-borderColor dark:border-gray-700 relative transition-all'>
        <Link to='/'>
            <img src={assets.logo} alt="" className="h-7 dark:brightness-0 dark:invert"/>
        </Link>
        <p>Welcome, {user?.name || "Owner"}</p>
    </div>
  )
}

export default NavbarOwner