import ZZN.Finite2

/-! The box 15 × 15, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_15_15 : (List.range 15).all (checkBoxC checkInst2 15 15) = true := by native_decide

end ZZN
