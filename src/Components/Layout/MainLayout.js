export default function MainLayout({ sidebar, topNav, children }) {
    return (
      <div className="flex h-screen bg-gray-50">
        {sidebar}
        <div className="flex-1 overflow-auto">
          {topNav}
          <main className="p-6">{children}</main>
        </div>
      </div>
    );
  }
  