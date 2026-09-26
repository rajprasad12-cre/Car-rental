import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import Title from '../../components/Owner/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const Dashboard = () => {

  const {axios, isOwner, currency} = useAppContext()

  const [data, setData] = useState({
    totalCars: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    recentBookings: [],
    monthlyRevenue: 0,
  })

  const dashboardCards =[
    {title: "Total Cars", value:data.totalCars, icon: assets.carIconColored},
    {title: "Total Bookings", value:data.totalBookings, icon: assets.listIconColored},
    {title: "Pending", value:data.pendingBookings, icon: assets.cautionIconColored},
    {title: "Confirmed", value:data.completedBookings, icon: assets.listIconColored},
  ]

  const fetchDashboardData = async ()=>{
    try {
      const { data } = await axios.get('/api/owner/dashboard')
      if (data.success){
        setData(data.dashboardData)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }    
  }

  useEffect(()=>{
    if(isOwner){
      fetchDashboardData()
    }
  },[isOwner])

  return (
    <div className='px-4 pt-10 md:px-10 flex-1'>
      <Title title="Admin Dashboard" subTitle="Monitor overall platform performance including total cars, bookings, revenue, and recent activities"/>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4 mt-8'>
        {dashboardCards.map((card, index)=>(
          <div key={card.title} className='rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-sm text-gray-500 dark:text-gray-400'>{card.title}</h1>
                <p className='text-2xl font-semibold text-gray-800 dark:text-gray-200 mt-1'>{card.value}</p>
              </div>
                <img src={card.icon} alt="" className='h-10 w-10'/>
            </div>
          </div>
        ))}
      </div>


      <div className='mt-8 grid gap-4 lg:grid-cols-2'>
          {/* recent bookings */}
        <div className='rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm'>
          <h1 className='text-lg font-semibold text-gray-800 dark:text-gray-200'>Recent bookings</h1>
          <p className='text-sm text-gray-500 dark:text-gray-400'>Latest customer bookings</p>
          <div className='mt-4 space-y-2'>
            {data.recentBookings.map((booking, index)=>(
              <div key={index} className='flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-700 px-3 py-2'>
                <div>
                  <p className='font-medium text-gray-800 dark:text-gray-200'>{booking.car?.brand} {booking.car?.model}</p>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>{booking.createdAt}</p>
                </div>
                <div className='flex items-center gap-2'>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>{currency}{booking.price}</p>
                  <span className={`rounded-full px-2 py-1 text-xs ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>  
        </div>

              {/* monthly revenue */}
              <div className='p-4 md:p-6 mb-6 border border-borderColor dark:border-gray-700 rounded-md w-full md:max-w-xs'>
                <h1 className='text-lg font-medium dark:text-gray-200'>Monthly Revenue</h1>
                <p className='text-gray-500 dark:text-gray-400'>Revenue for current month</p>
                <p className='text-3xl mt-6 font-semibold text-primary'>{currency}{data.monthlyRevenue}</p>
              </div>

      </div>
    </div>
  )
}

export default Dashboard