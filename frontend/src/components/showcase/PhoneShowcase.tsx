import PhoneFrame from './PhoneFrame'
import { CitrusAvocadoBowl, RainbowSalmonBowl, BerryChiaBowl } from './FoodArt'
import { ArrowRight, Sparkles, Home, PlusCircle, LineChart, User, Bookmark, ChevronRight } from 'lucide-react'

export default function PhoneShowcase() {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center py-8 lg:py-12 overflow-hidden">
      {/* Ambient Studio Lighting Behind Mockups */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full bg-accent/8 blur-[120px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-20 w-[600px] h-[350px] rounded-full bg-sand/6 blur-[100px] pointer-events-none"
        aria-hidden="true"
      />

      {/* 3-Phone Staggered Composition */}
      <div className="relative w-full max-w-[760px] flex items-center justify-center">
        {/* ======================================================== */}
        {/* PHONE 1: Food Experience Screen (Left, positioned lower) */}
        {/* ======================================================== */}
        <div className="hidden sm:block -mr-10 xl:-mr-8 translate-y-7 xl:translate-y-9 scale-[0.90] xl:scale-95 z-10 transition-all duration-300 hover:z-30 hover:scale-[0.96]">
          <PhoneFrame theme="dark" time="9:41" width={255} height={525}>
            {/* Screen Content: Food Experience */}
            <div className="relative w-full h-full bg-[#131211] text-cream flex flex-col justify-between overflow-hidden">
              {/* Floating Top Brand Bar */}
              <div className="pt-2 px-4 flex items-center justify-between z-20">
                <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                  <span className="text-[10px] font-bold tracking-wider text-cream">WELLORA</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                </div>
                <div className="w-6 h-6 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-cream/70">
                  <Bookmark size={12} />
                </div>
              </div>

              {/* Main Food Visual (Hero Centerpiece) */}
              <div className="relative flex-1 flex items-center justify-center -my-2">
                {/* Food Bowl Graphic with subtle shadow */}
                <div className="relative transform scale-[1.08] hover:scale-[1.12] transition-transform duration-500">
                  <CitrusAvocadoBowl size={240} />
                </div>
              </div>

              {/* Lower Overlay Card: Dish Details & Macros */}
              <div className="p-3.5 z-20">
                <div className="bg-black/60 backdrop-blur-md border border-white/12 rounded-tile p-3 shadow-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-semibold tracking-wider uppercase text-accent">
                      Featured Macro Bowl
                    </span>
                    <span className="text-[9px] text-muted font-medium">Seasonal</span>
                  </div>

                  <h3 className="text-xs font-bold text-cream mb-2 truncate">
                    Citrus & Avocado Quinoa
                  </h3>

                  {/* Micro Nutrients Grid */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-white/10 text-center">
                    <div className="bg-white/5 rounded-xs py-1">
                      <span className="block text-[10px] font-bold text-cream">520</span>
                      <span className="block text-[8px] text-muted">kcal</span>
                    </div>
                    <div className="bg-white/5 rounded-xs py-1">
                      <span className="block text-[10px] font-bold text-accent">28g</span>
                      <span className="block text-[8px] text-muted">protein</span>
                    </div>
                    <div className="bg-white/5 rounded-xs py-1">
                      <span className="block text-[10px] font-bold text-sand">14g</span>
                      <span className="block text-[8px] text-muted">fiber</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PhoneFrame>
        </div>

        {/* ======================================================== */}
        {/* PHONE 2: Nutrition Onboarding Screen (Center, elevated)  */}
        {/* ======================================================== */}
        <div className="z-20 scale-100 xl:scale-[1.05] drop-shadow-[0_30px_60px_rgba(0,0,0,0.9)] transition-all duration-300 hover:scale-[1.08]">
          <PhoneFrame theme="dark" time="9:41" width={265} height={545}>
            {/* Screen Content: Onboarding Screen */}
            <div className="relative w-full h-full bg-[#151413] text-cream flex flex-col justify-between overflow-hidden">
              {/* Upper Portion: Brand & Food Visual */}
              <div className="pt-2 px-4 flex flex-col items-center">
                {/* Header Logo */}
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-xs font-black tracking-widest text-cream">WELLORA</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                </div>

                {/* Appetizing Food Visual */}
                <div className="relative my-1">
                  <RainbowSalmonBowl size={200} />
                </div>
              </div>

              {/* Lower Portion: Refined Light-Colored Sheet */}
              <div className="bg-cream text-ink rounded-t-[30px] p-5 shadow-2xl flex flex-col justify-between shrink-0">
                {/* Category Pill */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-bold tracking-widest uppercase text-ink/60 bg-sand/60 px-2 py-0.5 rounded-full">
                    AI Nutrition System
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-1 rounded-full bg-accent" />
                    <span className="w-1.5 h-1 rounded-full bg-ink/20" />
                    <span className="w-1.5 h-1 rounded-full bg-ink/20" />
                  </div>
                </div>

                {/* Primary Heading */}
                <h3 className="text-base font-extrabold text-ink tracking-tight leading-snug mb-1">
                  Your nutrition journey starts here.
                </h3>

                <p className="text-[11px] text-ink/75 leading-relaxed mb-3">
                  Personalized baselines and explainable hunger-pattern detection.
                </p>

                {/* Interactive Goal Pills */}
                <div className="flex gap-1.5 mb-3.5">
                  <span className="px-2.5 py-1 text-[10px] font-semibold rounded-full bg-accent text-ink border border-accent flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-ink" />
                    Balanced Energy
                  </span>
                  <span className="px-2.5 py-1 text-[10px] font-medium rounded-full bg-surface text-ink/70 border border-line">
                    Lean Muscle
                  </span>
                </div>

                {/* Primary CTA Button */}
                <button
                  type="button"
                  className="w-full py-2.5 px-4 rounded-tile bg-panel text-cream font-semibold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer hover:bg-neutral-800 transition-colors"
                >
                  <span>Get Started</span>
                  <ArrowRight size={13} className="text-accent" />
                </button>
              </div>
            </div>
          </PhoneFrame>
        </div>

        {/* ======================================================== */}
        {/* PHONE 3: Nutrition Plan Screen (Right, positioned lower) */}
        {/* ======================================================== */}
        <div className="hidden sm:block -ml-10 xl:-ml-8 translate-y-7 xl:translate-y-9 scale-[0.90] xl:scale-95 z-10 transition-all duration-300 hover:z-30 hover:scale-[0.96]">
          <PhoneFrame theme="light" time="9:41" width={255} height={525}>
            {/* Screen Content: Personalized Plan (Light Cream Theme) */}
            <div className="relative w-full h-full bg-cream text-ink flex flex-col justify-between overflow-hidden">
              {/* Top Navigation / Brand */}
              <div className="pt-2 px-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black tracking-widest text-ink">WELLORA</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                </div>
                <div className="text-[9px] font-bold text-accent bg-accent/15 px-2 py-0.5 rounded-full">
                  WEEK 1
                </div>
              </div>

              {/* Header Content */}
              <div className="px-4 pt-2">
                <h3 className="text-sm font-extrabold text-ink tracking-tight leading-snug mb-0.5">
                  Let's build your nutrition plan
                </h3>
                <p className="text-[10px] text-ink/70 leading-relaxed">
                  Calibrated to your personal weekly baseline.
                </p>

                {/* Dark Rounded CTA */}
                <button
                  type="button"
                  className="w-full mt-2.5 py-2 px-3 rounded-tile bg-panel text-cream font-semibold text-[11px] flex items-center justify-center gap-1.5 shadow-sm cursor-pointer hover:bg-neutral-800 transition-colors"
                >
                  <Sparkles size={11} className="text-accent" />
                  <span>Generate Weekly Plan</span>
                </button>
              </div>

              {/* Food Photography Cards (Middle/Bottom) */}
              <div className="px-4 space-y-2 py-2">
                <div className="text-[9px] font-bold uppercase tracking-wider text-muted">
                  Suggested Today
                </div>

                {/* Card 1: Breakfast Chia */}
                <div className="bg-surface border border-line rounded-tile p-2 flex items-center gap-2.5 shadow-xs">
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-sand/30 flex items-center justify-center">
                    <BerryChiaBowl size={52} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-ink truncate">Berry Chia Bowl</span>
                      <span className="text-[9px] font-semibold text-accent">360 kcal</span>
                    </div>
                    <span className="text-[8px] text-muted block truncate">High Fiber · Morning</span>
                  </div>
                  <ChevronRight size={12} className="text-muted shrink-0" />
                </div>

                {/* Card 2: Citrus Quinoa Lunch */}
                <div className="bg-surface border border-line rounded-tile p-2 flex items-center gap-2.5 shadow-xs">
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-sand/30 flex items-center justify-center">
                    <CitrusAvocadoBowl size={52} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-ink truncate">Citrus Avocado</span>
                      <span className="text-[9px] font-semibold text-accent">520 kcal</span>
                    </div>
                    <span className="text-[8px] text-muted block truncate">28g Protein · Baseline</span>
                  </div>
                  <ChevronRight size={12} className="text-muted shrink-0" />
                </div>
              </div>

              {/* Bottom Mobile Navigation Bar */}
              <div className="bg-surface border-t border-line px-5 py-2 flex items-center justify-between shrink-0">
                <div className="flex flex-col items-center gap-0.5 text-accent">
                  <Home size={13} />
                  <span className="text-[7px] font-bold">Home</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 text-muted hover:text-ink">
                  <PlusCircle size={13} />
                  <span className="text-[7px] font-medium">Log</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 text-muted hover:text-ink">
                  <LineChart size={13} />
                  <span className="text-[7px] font-medium">Patterns</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 text-muted hover:text-ink">
                  <User size={13} />
                  <span className="text-[7px] font-medium">Profile</span>
                </div>
              </div>
            </div>
          </PhoneFrame>
        </div>
      </div>

      {/* Showcase Caption / Pill */}
      <div className="mt-6 flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-muted text-[11px] backdrop-blur-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        <span>Live Mobile Application Preview</span>
      </div>
    </div>
  )
}
