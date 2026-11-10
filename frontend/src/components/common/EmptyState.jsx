const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {Icon && (
      <div className="w-16 h-16 bg-navy-700 rounded-2xl flex items-center justify-center mb-4">
        <Icon size={28} className="text-gray-500" />
      </div>
    )}
    <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
    <p className="text-sm text-gray-400 max-w-xs mb-4">{description}</p>
    {action}
  </div>
);

export default EmptyState;
