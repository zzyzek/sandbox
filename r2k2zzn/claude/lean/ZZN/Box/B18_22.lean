import ZZN.Finite2

/-! The box 18 × 22, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_18_22 : (List.range 18).all (checkBoxC checkInst2 18 22) = true := by native_decide

end ZZN
