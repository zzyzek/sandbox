import ZZN.Finite2

/-! The box 17 × 17, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_17_17 : (List.range 17).all (checkBoxC checkInst2 17 17) = true := by native_decide

end ZZN
