import { useQuery } from '@tanstack/react-query'
import AppHeader from '../../components/AppHeader'
import HeroBanner from '../../components/HeroBanner'
import ActiveCategorySlider from '../../components/ActiveCategorySlider'
import AboutUs from '../../components/AboutUs'
import { featuredCategoryService } from '../../api/featuredCategoryService'

const HomePage = () => {
  const { data: featuredCategories = [] } = useQuery({
    queryKey: ['public-featured-categories'],
    queryFn: featuredCategoryService.getPublic,
  })

  return (
    <div className="min-h-screen bg-gray-100">
      <AppHeader showSearch={false} />
      <HeroBanner />
      <ActiveCategorySlider categories={featuredCategories} />
      <AboutUs />
    </div>
  )
}

export default HomePage
