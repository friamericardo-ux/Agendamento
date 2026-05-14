export default function Button({ children, variant = 'primary', loading, className = '', ...props }) {
  const base = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50'
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-gray-600 hover:bg-gray-100',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} disabled={loading} {...props}>
      {loading && <span className="animate-spin mr-2 inline-block">&#9696;</span>}
      {children}
    </button>
  )
}
