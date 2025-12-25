from pydantic import BaseModel
from typing import List, Dict, Optional, Union

class IngestRequest(BaseModel):
    text: Union[str, List[str]]  # Accept both single string and list
    metadata: Optional[Dict] = None


class IngestResponse(BaseModel):
    id: Union[str, List[str]]  # Return single ID or list of IDs