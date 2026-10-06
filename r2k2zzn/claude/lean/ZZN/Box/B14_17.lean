import ZZN.Finite2

/-! The box 14 × 17, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_14_17 : (List.range 14).all (checkBoxC checkInst2 14 17) = true := by native_decide

end ZZN
