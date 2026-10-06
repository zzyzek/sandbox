import ZZN.Finite2

/-! The box 15 × 17, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_15_17 : (List.range 15).all (checkBoxC checkInst2 15 17) = true := by native_decide

end ZZN
