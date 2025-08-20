import React, { useState } from 'react'
import TextInput from '../../common/TextInput'

type Props = {}

const Contract_202 = (props: Props) => {
    const [item, setItem] = useState<string>("")
    const [quantity, setQuantity] = useState<string>("")

    return (
        <form>
            <div className="form-group">
                <label>물품</label>
                <TextInput
                type='text'
                value={item}
                onChange={(e)=>setItem(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label>양</label>
                <TextInput
                type='text'
                value={item}
                onChange={(e)=>setQuantity(e.target.value)}
                />
            </div>
        </form>
    )
}

export default Contract_202