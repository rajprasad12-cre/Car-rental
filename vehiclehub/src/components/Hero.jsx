import React, { useState } from 'react'
import { assets, cityList } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import {delay, motion} from 'motion/react';

const Hero = () => {

    const [pickupLocation, setPickupLocation] = useState('')

    const {pickupDate, setPickupDate, returnDate, setReturnDate, navigate} = useAppContext()

    const handleSearch = (e)=>{
        e.preventDefault()
        navigate('/cars?pickupLocation=' + pickupLocation + '&pickupDate=' + pickupDate + '&returnDate=' + returnDate)
    }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1}}
      transition={{ duration: 0.8 }}
      className='relative isolate min-h-[calc(100vh-72px)] overflow-hidden flex flex-col items-center justify-center gap-8 md:gap-10 px-5 py-20 md:px-10 lg:px-16 bg-[#07111f] text-center text-white'>

        <div className='absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_35%,rgba(37,99,235,0.28),transparent_34%),linear-gradient(135deg,#07111f_0%,#0b1d32_55%,#102d46_100%)]' />
        <div className='absolute inset-0 -z-10 opacity-25 [background-image:linear-gradient(rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.14)_1px,transparent_1px)] [background-size:52px_52px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]' />
        <div className='absolute left-[-10%] top-1/4 -z-10 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl' />
        <div className='absolute right-[-8%] bottom-10 -z-10 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl' />

        <motion.div
          initial={{ y: -15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className='flex items-center gap-3 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-blue-100 backdrop-blur-sm'>
            <span className='h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.9)]' />
            Premium rides, ready when you are
        </motion.div>

        <motion.h1 initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2}}
            className='max-w-3xl text-4xl font-semibold leading-tight md:text-6xl'>Luxury cars <span className='text-cyan-300'>on rent</span></motion.h1>

        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className='max-w-xl text-sm leading-6 text-slate-300 md:text-base'>
            Make every journey feel exceptional. Choose your car, set your dates, and hit the road with confidence.
        </motion.p>

        <motion.form
          initial={{ scale: 0.95, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0}}
          transition={{ duration: 0.6, delay: 0.4 }}

          onSubmit={handleSearch} className='relative z-10 flex w-full max-w-4xl flex-col items-start justify-between gap-4 rounded-2xl border border-white/20 bg-white/95 p-4 text-gray-900 shadow-[0_24px_70px_rgba(0,0,0,0.35)] backdrop-blur-md md:flex-row md:items-center md:rounded-full md:p-3 md:pl-7'>

            <div className='flex w-full flex-col items-start gap-4 md:flex-row md:items-center md:gap-6'>
                <div className='flex flex-col  items-start gap-2'>
                    <select required value={pickupLocation} onChange={(e)=>setPickupLocation(e.target.value)} className='w-full rounded-lg border border-borderColor bg-white px-4 py-2 text-gray-500 outline-none md:w-auto'>
                        <option value="">Pickup Location</option>
                            {cityList.map((city)=> <option key={city} value={city}>{city}</option>)}
                    </select>
                    <p className='px-1 text-sm text-gray-500 dark:text-gray-400'>{pickupLocation ? pickupLocation : 'Please select location'}</p>
                </div>
                <div className='flex flex-col  items-start gap-2'>
                    <label htmlFor='pickup-date' className='text-sm font-medium'>Pick-up Date</label>
                    <input value={pickupDate} onChange={e=>setPickupDate(e.target.value)} type="date" id="pickup-date" min={new Date().toISOString().split('T')[0]} className='text-sm text-gray-500 outline-none' required/>
                </div>
                <div className='flex flex-col  items-start gap-2'>
                    <label htmlFor='return-date' className='text-sm font-medium'>Return Date</label>
                    <input value={returnDate} onChange={e=>setReturnDate(e.target.value)} type="date" id="return-date" className='text-sm text-gray-500 outline-none' required/>
                </div>
        
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className='flex w-full items-center justify-center gap-1 rounded-full bg-primary px-9 py-3 text-white transition-colors hover:bg-primary-dull cursor-pointer md:w-auto'>
                    <img src={assets.search_icon} alt="search" className='brightness-300'/>
                    Search
                </motion.button>
            </div>
        </motion.form>

        <div className='relative mt-2 flex w-full max-w-5xl items-center justify-center'>
          <div className='absolute bottom-4 h-10 w-3/4 rounded-[50%] bg-black/60 blur-2xl' />
          <motion.img 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            src={assets.main_car} alt="Luxury silver sedan" className='relative z-10 w-full max-w-4xl object-contain drop-shadow-[0_22px_18px_rgba(0,0,0,0.45)]'/>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className='flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs text-slate-300 md:text-sm'>
            <span>100+ premium vehicles</span>
            <span className='hidden h-1 w-1 self-center rounded-full bg-cyan-300 sm:block' />
            <span>Flexible booking</span>
            <span className='hidden h-1 w-1 self-center rounded-full bg-cyan-300 sm:block' />
            <span>Trusted by happy drivers</span>
        </motion.div>
    </motion.div>
  )
}

export default Hero