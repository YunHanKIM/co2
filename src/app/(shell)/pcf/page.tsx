const PcfPage = () => {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold tracking-tight text-app-text">
        PCF 활동 데이터
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-app-muted">
        전기·원소재·운송 활동과 배출계수를 곱한 배출량을 시각화합니다. 다음
        단계에서 시드 데이터와 합산 로직을 연결합니다.
      </p>
      <div className="mt-8 rounded-xl border border-app-border bg-app-surface p-8 text-center text-sm text-app-muted">
        PCF 차트·표 영역 (예정)
      </div>
    </div>
  )
}

export default PcfPage
