import ZZN.Finite2

/-! The box 17 × 21, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_17_21 : (List.range 17).all (checkBoxC checkInst2 17 21) = true := by native_decide

end ZZN
