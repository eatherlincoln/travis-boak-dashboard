// …existing imports/logic

return (
  <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-sm">
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-sky-100">
          {/* choose icon per platform if you like; Users is safe */}
          {/* <Users className="h-4 w-4 text-sky-600" /> */}
          <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
        </span>
        <h3 className="text-sm font-semibold text-neutral-800">
          {titleForPlatform(platform)} Audience
        </h3>
      </div>
      {data?.updated_at && (
        <span className="text-[11px] text-neutral-500">
          Updated {new Date(data.updated_at).toLocaleDateString()}
        </span>
      )}
    </div>

    {/* Gender */}
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-lg border border-neutral-200 p-3">
        <div className="text-[11px] font-medium text-neutral-500">Men</div>
        <div className="text-sm font-semibold text-neutral-900">
          {data?.gender?.men ?? 0}%
        </div>
      </div>
      <div className="rounded-lg border border-neutral-200 p-3">
        <div className="text-[11px] font-medium text-neutral-500">Women</div>
        <div className="text-sm font-semibold text-neutral-900">
          {data?.gender?.women ?? 0}%
        </div>
      </div>
    </div>

    {/* Age groups */}
    <div className="mt-3">
      <div className="text-[11px] font-medium text-neutral-500 mb-1">
        Age Groups
      </div>
      <div className="grid grid-cols-2 gap-2">
        {(data?.age_groups ?? []).slice(0, 6).map((a, i) => (
          <div
            key={i}
            className="rounded-lg border border-neutral-200 p-2 text-[12px]"
          >
            <span className="font-medium">{a.range}</span>
            <span className="ml-1 text-neutral-600">{a.percentage}%</span>
          </div>
        ))}
      </div>
    </div>

    {/* Countries */}
    <div className="mt-3">
      <div className="text-[11px] font-medium text-neutral-500 mb-1">
        Top Countries
      </div>
      <div className="flex flex-wrap gap-2">
        {(data?.countries ?? []).slice(0, 3).map((c, i) => (
          <span
            key={i}
            className="rounded-full border border-neutral-200 px-2 py-1 text-[12px]"
          >
            {c.country} • {c.percentage}%
          </span>
        ))}
      </div>
    </div>

    {/* Cities */}
    <div className="mt-3">
      <div className="text-[11px] font-medium text-neutral-500 mb-1">
        Top Cities
      </div>
      <div className="flex flex-wrap gap-2">
        {(data?.cities ?? []).slice(0, 4).map((city, i) => (
          <span
            key={i}
            className="rounded-full bg-neutral-100 px-2 py-1 text-[12px] text-neutral-700"
          >
            {city}
          </span>
        ))}
      </div>
    </div>
  </div>
);
