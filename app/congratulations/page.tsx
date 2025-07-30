import Link from 'next/link'
import { PartyPopper } from 'lucide-react'

export default function CongratulationsPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-100 to-white">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <PartyPopper size={48} className="mx-auto text-primary-600 mb-4" />
        <h1 className="text-3xl font-bold text-primary-600 mb-4">Congratulations!</h1>
        <p className="text-gray-700 mb-6">You've completed this recipe. Enjoy your meal and share your experience with others!</p>
        <Link href="/" className="btn-primary">Back to Recipes</Link>
      </div>
    </div>
  )
}
