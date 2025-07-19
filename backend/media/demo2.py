def twoSum(nums:List[int],target:int)->int:
    hm = {}
    for i,n in enumerate(nums):
        if target - n in hm:
            return [hm[target-n],i]
        else:
            hm[n]=i 
    return []
