import ZZN.Finite2

/-! The box 17 × 11, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_17_11 : (List.range 17).all (checkBoxC checkInst2 17 11) = true := by native_decide

end ZZN
