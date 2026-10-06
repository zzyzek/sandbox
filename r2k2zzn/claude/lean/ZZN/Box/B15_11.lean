import ZZN.Finite2

/-! The box 15 × 11, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_15_11 : (List.range 15).all (checkBoxC checkInst2 15 11) = true := by native_decide

end ZZN
