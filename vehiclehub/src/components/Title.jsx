import React from 'react'

const Title = ({ title, subTitle, align }) => {
  const description = subTitle ?? subtitle ?? ''

  return (
    <div className={`flex flex-col justify-center items-center text-center &{align === "left" && " md:items-start md:text-left"}`}>
    <h1 className='font-semiboid text-4x1 md:text-[40px] text-left'>{title}</h1>
    {description ? <p className='text-sm md:text-base text-gray-500/90 dark:text-gray-400/90 mt-2 max-w-156 text-left'>{description}</p> : null}
    </div>
  )
}

export default Title