import ZZN.Finite2

/-! The box 17 × 14, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_17_14 : (List.range 17).all (checkBoxC checkInst2 17 14) = true := by native_decide

end ZZN
