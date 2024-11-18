import React from "react";

function AddItemButton({ onAdd }) {
    return (
        <button className="addButton" onClick={onAdd}>+</button>
    )
}

export default AddItemButton