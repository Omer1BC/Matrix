''''''
from typing import *
''''''
def twoSum(nums:List[int],target:int)->int:
    hm = {}
    for i,n in enumerate(nums):
        if target - n in hm:
            return [hm[target-n],i]
        else:
            hm[n]=i 
    return []
''''''
def run_test(nums, target, expected):
    exception = ""
    result = ""
    try:
        result = (twoSum(nums, target))
        
    except Exception as e:
        exception = str(e)
    return {"target": target, 
          "nums": nums, 
          "expected": sorted(expected),
          "actual": result, 
          "error": exception}
test_cases = [
    ([2, 7, 11, 15], 9, [0, 1]),
    ([3, 2, 4], 6, [1, 2]),
    ([3, 3], 6, [0, 1]),
]
results = { f"{i}": run_test(nums, target, expected) for i, (nums, target, expected) in enumerate(test_cases)}
print(results)