export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          JHUB Gallery
        </h1>
        <p className="text-center text-muted-foreground mb-4">
          Fast and elegant photo gallery system
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Admin Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Upload, organize, and manage your photo collections
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Public Gallery</h2>
            <p className="text-sm text-muted-foreground">
              Share and view beautiful photo galleries
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
