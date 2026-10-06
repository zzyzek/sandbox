import ZZN.Finite2

/-! The box 19 × 18, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_19_18 : (List.range 19).all (checkBoxC checkInst2 19 18) = true := by native_decide

end ZZN
