const DashboardHomePage = () => {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight text-app-text">
        경영 대시보드
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-app-muted">
        회사·국가·월별 온실가스 배출을 한눈에 봅니다. 다음 단계에서 차트와
        필터를 연결합니다.
      </p>
      <div className="mt-8 rounded-xl border border-app-border bg-app-surface p-8 text-center text-sm text-app-muted">
        데이터 시각화 영역 (예정)
      </div>
    </div>
  )
}

export default DashboardHomePage
