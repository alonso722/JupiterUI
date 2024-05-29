import { Button } from '../form/button';
import { colors } from '../types/enums/colors';

const AddButton = ({ data = [], fileName }) => {
  return (
    <div className="grid grid-rows-1 mt-[10px]">
    <Button
        roundeds
        color={colors.ALTERNATIVE}>
        Añadir
    </Button>
</div>
  );
};

export default AddButton;